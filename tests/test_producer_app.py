import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from unittest.mock import patch, MagicMock
from kafka import producer_app

def fake_api_response():
    """Create a fake response object for requests.get"""
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "response": [
            {"hex": "abc123", "data": "testdata"},
            {"hex": "def456", "data": "testdata2"}
        ]
    }
    return mock_resp

@patch('kafka.producer_app.Producer')
@patch('kafka.producer_app.requests.get')
def test_producer_app_fetch_and_produce(mock_get, MockProducer):
    # 1. Mock the API response
    mock_get.return_value = fake_api_response()
    
    # 2. Mock Kafka producer
    mock_producer_instance = MockProducer.return_value
    
    producer_app.api_url = "http://fakeapi.com"  # Set any dummy value if needed
    producer_app.produce_from_api()  # This should be your logic moved into a function

    # 4. Check that produce() was called for each object in the response
    calls = mock_producer_instance.produce.call_args_list
    assert len(calls) == 2  # There were 2 objects, so 2 Kafka messages should be sent

    # 5. Check one of the calls' arguments
    first_call_args, first_call_kwargs = calls[0]
    assert first_call_args[0] == 'flights'  # topic
    assert first_call_kwargs['key'] == 'abc123'  # key from API response
    # check the value content:
    import json
    value_data = json.loads(first_call_kwargs['value'])
    assert value_data['data'] == 'testdata'
