from confluent_kafka import Producer, Consumer
from confluent_kafka.admin import AdminClient, NewTopic
import os
import json
import logging

KAFKA_BROKER = os.getenv("KAFKA_BROKER_URL", "localhost:9092")

def ensure_topic_exists(topic_name: str):
    """Creates the Kafka topic programmatically if it does not yet exist."""
    admin = AdminClient({'bootstrap.servers': KAFKA_BROKER})
    try:
        topic_metadata = admin.list_topics(timeout=5)
        if topic_name not in topic_metadata.topics:
            new_topic = NewTopic(topic_name, num_partitions=1, replication_factor=1)
            admin.create_topics([new_topic])
            logging.info(f"Auto-created missing Kafka topic: {topic_name}")
    except Exception as e:
        logging.warning(f"Could not auto-create topic {topic_name}: {e}")

def get_kafka_producer():
    conf = {'bootstrap.servers': KAFKA_BROKER}
    return Producer(conf)

def get_kafka_consumer(group_id: str):
    conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': group_id,
        'auto.offset.reset': 'earliest'
    }
    return Consumer(conf)

def produce_event(producer: Producer, topic: str, key: str, value: dict):
    """Publish a Python dictionary as a JSON serialized message to Kafka."""
    try:
        producer.produce(topic, key=key, value=json.dumps(value).encode('utf-8'))
        producer.flush()
    except Exception as e:
        logging.error(f"Failed to produce Kafka message: {e}")
