# kafka/create_es_index.py

def create_index_if_needed(es, index_name, mapping):
    """
    Create Elasticsearch index with mapping if it doesn't exist.
    Returns "created" if created, "exists" if already present.
    """
    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name, body=mapping)
        return "created"
    else:
        return "exists"
