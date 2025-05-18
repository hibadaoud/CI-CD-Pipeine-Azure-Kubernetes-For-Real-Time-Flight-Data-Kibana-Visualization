
# iata_country_dict = {}
# iata_position_dict = {}
# iata_name_dict = {}

# def set_iata_dicts(country_dict, position_dict, name_dict):
#     global iata_country_dict, iata_position_dict, iata_name_dict
#     iata_country_dict = country_dict
#     iata_position_dict = position_dict
#     iata_name_dict = name_dict

# Define the flight type determination function
# spark/spark_udfs.py

def make_determine_flight_type(b_country_dict):
    def _determine_flight_type(dep_iata, arr_iata):
        dep_country_code = b_country_dict.value.get(dep_iata, None)
        arr_country_code = b_country_dict.value.get(arr_iata, None)
        if dep_country_code and arr_country_code:
            if dep_country_code == arr_country_code:
                return "Domestic"
            else:
                return "International"
        else:
            return "Unknown"
    return _determine_flight_type

def make_get_position(b_position_dict):
    def _get_position(iata):
        return b_position_dict.value.get(iata, (0.0, 0.0))
    return _get_position

def make_get_name(b_name_dict):
    def _get_name(iata):
        return b_name_dict.value.get(iata, None)
    return _get_name
