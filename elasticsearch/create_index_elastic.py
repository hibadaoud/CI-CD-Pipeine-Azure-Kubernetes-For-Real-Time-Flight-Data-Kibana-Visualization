from elasticsearch import Elasticsearch
from elasticsearch.create_es_index import create_index_if_needed

# Create an Elasticsearch client
es = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])

# Define the index name
index_name = "esflight"

# Define the mapping for Elasticsearch index
mapping = {
    "mappings": {
        "properties": {
            "position": {"type": "geo_point"},
            "hex": {"type": "keyword"},
            "reg_number": {"type": "keyword"},
            "flag": {"type": "keyword"},
            "alt": {"type": "float"},
            "dir": {"type": "float"},
            "speed": {"type": "integer"},
            "v_speed": {"type": "integer"},
            "flight_number": {"type": "keyword"},
            "flight_icao": {"type": "keyword"},
            "flight_iata": {"type": "keyword"},
            "dep_iata": {"type": "keyword"},
            "arr_iata": {"type": "keyword"},
            "airline_iata": {"type": "keyword"},
            "aircraft_icao": {"type": "keyword"},
            "status": {"type": "keyword"},
            "type": {"type": "keyword"},
            "arr_pos": {"type": "geo_point"},
            "dep_pos": {"type": "geo_point"},
            "Departure": {"type": "keyword"},
            "Arrival": {"type": "keyword"},
        }
    }
}

# Call your function
result = create_index_if_needed(es, index_name, mapping)
if result == "created":
    print(f"Index '{index_name}' has been created.")
else:
    print(f"Index '{index_name}' already exists. No action taken.")
