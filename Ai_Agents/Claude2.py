#Install pre requests for api key
!pip install requests

import requests

API_KEY = "a4fed5ad49cb45543c7cc6da710ae9c8"
def get_weather(city):
    """
    Mock weather tool
    """
    return f"It is 30°C and sunny in {city}."

def ask_assistant(user_question):

    weather_keywords = [
        "weather",
        "umbrella",
        "rain",
        "temperature",
        "sunny",
        "forecast"
    ]

    # Check whether tool is needed
    if any(keyword in user_question.lower() for keyword in weather_keywords):

        print("Tool Called: get_weather")

        city = "Jaipur"  # For assignment demo

        tool_result = get_weather(city)

        print("Tool Result:",tool_result)

        print("\nAssistant Response:")
        print(
            f"Based on the weather information, {tool_result} "
            "You likely do not need an umbrella today."
        )

    else:

        print("Tool Not Called")

        if "capital of rajasthan" in user_question.lower():
            print("\nAssistant Response:")
            print("Jaipur is the capital of Rajasthan.")
        else:
            print("\nAssistant Response:")
            print("I can answer that without using the weather tool.")

print("TEST CASE 1")
print("User: Should I carry an umbrella in Jaipur today?\n")

ask_assistant("Should I carry an umbrella in Jaipur today?")


print("\n" + "="*50 + "\n")

print("TEST CASE 2")
print("User: What is the capital of Rajasthan?\n")

ask_assistant("What is the capital of Rajasthan?")
