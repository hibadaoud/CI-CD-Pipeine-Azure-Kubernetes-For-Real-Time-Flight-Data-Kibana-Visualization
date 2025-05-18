import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from unittest.mock import MagicMock
from elasticsearch.create_es_index import create_index_if_needed

def test_create_index_when_not_exists():
    # Arrange
    mock_es = MagicMock()
    mock_es.indices.exists.return_value = False
    index_name = "esflight"
    mapping = {"mappings": {"properties": {}}}

    # Act
    result = create_index_if_needed(mock_es, index_name, mapping)

    # Assert
    mock_es.indices.exists.assert_called_once_with(index=index_name)
    mock_es.indices.create.assert_called_once_with(index=index_name, body=mapping)
    assert result == "created"

def test_create_index_when_exists():
    # Arrange
    mock_es = MagicMock()
    mock_es.indices.exists.return_value = True
    index_name = "esflight"
    mapping = {"mappings": {"properties": {}}}

    # Act
    result = create_index_if_needed(mock_es, index_name, mapping)

    # Assert
    mock_es.indices.exists.assert_called_once_with(index=index_name)
    mock_es.indices.create.assert_not_called()
    assert result == "exists"
