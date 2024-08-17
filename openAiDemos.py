from openai import OpenAI
import json

class GPT3Chat:
    def __init__(self, api_key):
        self.api_key = api_key
        self.client = OpenAI(api_key=self.api_key)
        self.prompt = "Generate 10 advanced search queries based on the following input: {}"
        self.model = "gpt-3.5-turbo"

    def get_completion(self, user_message):
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Generate search queries based on user input. Result should in the Json Format example '''{'1':'result 1', '3':'result 1', '2':'result 1'}'''"},
                    {"role": "user", "content": self.prompt.format(user_message)}
                ],
                max_tokens=150
            )
            # Access content properly
            response = completion.choices[0].message.content
            print(completion.choices[0].message.content)
            queries = response.strip().split('\n')
            return queries
        except Exception as e:
            print(f"Error: {e}")
            return None

if __name__ == '__main__':
    api_key = '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'
    gpt_chat = GPT3Chat(api_key)
    
    user_input = input('Enter your query: ')
    queries = gpt_chat.get_completion(user_input)
    
    if queries:
        print('Generated queries:')
        for query in queries:
            print(query)
