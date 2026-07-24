from google import genai

client = genai.Client(api_key="AIzaSyDdqT9xW6FIoK9-IwIFe8qiXTC1ZPDpklg")

for model in client.models.list():
    print(model.name)