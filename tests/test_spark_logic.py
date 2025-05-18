import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from pyspark.sql import SparkSession, Row
from pyspark.sql.functions import udf
from pyspark.sql.types import StringType, StructType, StructField, DoubleType
from spark import spark_udfs

from pyspark.sql import SparkSession
from spark import spark_udfs

def test_make_determine_flight_type():
    # Test dict
    country_dict = {'CDG': 'FR', 'JFK': 'US', 'ORY': 'FR'}
    # We can use a mock broadcast with a .value property for pure Python test
    class MockBroadcast:
        def __init__(self, value):
            self.value = value
    b_country_dict = MockBroadcast(country_dict)

    func = spark_udfs.make_determine_flight_type(b_country_dict)
    assert func('CDG', 'ORY') == 'Domestic'
    assert func('CDG', 'JFK') == 'International'
    assert func('CDG', 'XXX') == 'Unknown'
    assert func('XXX', 'CDG') == 'Unknown'
    assert func('XXX', 'YYY') == 'Unknown'

def test_make_get_position():
    position_dict = {'CDG': (48.8566, 2.3522), 'JFK': (40.6413, -73.7781)}
    class MockBroadcast:
        def __init__(self, value):
            self.value = value
    b_position_dict = MockBroadcast(position_dict)

    func = spark_udfs.make_get_position(b_position_dict)
    assert func('CDG') == (48.8566, 2.3522)
    assert func('JFK') == (40.6413, -73.7781)
    assert func('XXX') == (0.0, 0.0)

def test_make_get_name():
    name_dict = {'CDG': 'Charles de Gaulle', 'JFK': 'John F Kennedy'}
    class MockBroadcast:
        def __init__(self, value):
            self.value = value
    b_name_dict = MockBroadcast(name_dict)

    func = spark_udfs.make_get_name(b_name_dict)
    assert func('CDG') == 'Charles de Gaulle'
    assert func('JFK') == 'John F Kennedy'
    assert func('XXX') is None


def test_spark_udfs_in_dataframe():
    spark = SparkSession.builder.master("local").appName("pytest").getOrCreate()

    # Broadcast the dicts!
    country_dict = {'CDG': 'FR', 'JFK': 'US', 'ORY': 'FR'}
    position_dict = {'CDG': (48.8566, 2.3522), 'JFK': (40.6413, -73.7781)}
    name_dict = {'CDG': 'Charles de Gaulle', 'JFK': 'John F Kennedy'}

    b_country_dict = spark.sparkContext.broadcast(country_dict)
    b_position_dict = spark.sparkContext.broadcast(position_dict)
    b_name_dict = spark.sparkContext.broadcast(name_dict)

    # Build the UDFs with the broadcast variables
    flight_type_udf = udf(spark_udfs.make_determine_flight_type(b_country_dict), StringType())
    get_position_udf = udf(spark_udfs.make_get_position(b_position_dict),
                           StructType([StructField("lat", DoubleType()), StructField("lon", DoubleType())]))
    get_name_udf = udf(spark_udfs.make_get_name(b_name_dict), StringType())

    data = [
        Row(dep_iata="CDG", arr_iata="ORY", some_iata="CDG"),
        Row(dep_iata="CDG", arr_iata="JFK", some_iata="JFK"),
        Row(dep_iata="CDG", arr_iata="XXX", some_iata="XXX")
    ]
    df = spark.createDataFrame(data)

    df2 = df.withColumn("type", flight_type_udf(df.dep_iata, df.arr_iata)) \
            .withColumn("position", get_position_udf(df.some_iata)) \
            .withColumn("name", get_name_udf(df.some_iata))

    results = df2.collect()
    assert results[0]["type"] == "Domestic"
    assert results[1]["type"] == "International"
    assert results[2]["type"] == "Unknown"
    assert results[0]["position"].asDict() == {"lat": 48.8566, "lon": 2.3522}
    assert results[1]["position"].asDict() == {"lat": 40.6413, "lon": -73.7781}
    assert results[2]["position"].asDict() == {"lat": 0.0, "lon": 0.0}
    assert results[0]["name"] == "Charles de Gaulle"
    assert results[1]["name"] == "John F Kennedy"
    assert results[2]["name"] is None

    spark.stop()
