from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

def trigger_playwright_scraper():
    print("Triggering Playwright to scrape JS-rendered supplier portals.")

def trigger_scrapy_feeds():
    print("Triggering Scrapy for static trade feeds.")

default_args = {
    'owner': 'data_eng',
    'depends_on_past': False,
    'start_date': datetime(2026, 3, 25),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'live_market_intelligence_scraping',
    default_args=default_args,
    description='Schedules high-frequency market data scraping',
    schedule_interval=timedelta(hours=4),
    catchup=False
) as dag:

    js_scrape = PythonOperator(
        task_id='playwright_supplier_scrape',
        python_callable=trigger_playwright_scraper
    )

    static_scrape = PythonOperator(
        task_id='scrapy_trade_feed_scrape',
        python_callable=trigger_scrapy_feeds
    )

    js_scrape >> static_scrape
