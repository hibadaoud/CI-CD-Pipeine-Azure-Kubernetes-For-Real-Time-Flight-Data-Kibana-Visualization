
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
