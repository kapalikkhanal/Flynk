from gtts import gTTS
from pydub import AudioSegment
from pydub.playback import play
import io
import os

# Define the temporary directory and file paths
temp_dir = "temp_audio"
output_file_name = "output.mp3"
output_file_path = os.path.join(temp_dir, output_file_name)

def create_directory(directory):
    """
    Create a directory if it doesn't exist.
    
    :param directory: The path to the directory to create.
    """
    if not os.path.exists(directory):
        os.makedirs(directory)

def text_to_speech(text, lang='hi'):
    """
    Convert text to speech and play the audio.
    
    :param text: The text you want to convert to speech.
    :param lang: The language in which the text should be spoken (e.g., 'hi' for Hindi, 'ne' for Nepali).
    :return: The path to the saved audio file.
    """
    try:
        # Generate speech using gTTS
        tts = gTTS(text, lang=lang)
        
        # Save to a file-like object
        with io.BytesIO() as audio_buffer:
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            audio = AudioSegment.from_file(audio_buffer, format='mp3')
        
        # Ensure the temporary directory exists
        create_directory(temp_dir)
        
        # Optionally save the audio to a file in the temporary directory
        audio.export(output_file_path, format="mp3")
        
        # Play the audio
        play(audio)
        
        return output_file_path
    
    except PermissionError as e:
        print(f"Permission error: {e}")
        print("Try running the script as an administrator or checking the permissions of the directory.")
        return None

if __name__ == "__main__":
    # Example text
    text = "अष्ट्रेलियाले ‘विश्वको सबैभन्दा ठूलो सौर्य तथा बेट्री फर्म’ परियोजनालाई स्वीकृति दिएको छ। यस परियोजनाले सिंगापुरलाई ऊर्जा निर्यात गर्नेछ।"  # Nepali
    # text = "नमस्ते, आप कैसे हैं?"  # Hindi

    # Convert the text to speech
    output_file = text_to_speech(text, lang='ne')  # 'hi' for Hindi, 'ne' for Nepali

    # Print the path to the saved file if successful
    if output_file:
        print(f"Audio saved to {output_file}")
