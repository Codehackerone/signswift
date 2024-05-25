from pytube import YouTube


def download_yt_video(yt_url: str, output_path: str) -> bool:
    """
    Downloads a YouTube video given its URL and saves it to the specified output path.

    Args:
        yt_url (str): The URL of the YouTube video.
        output_path (str): The path where the downloaded video will be saved.

    Returns:
        bool: True if the video is downloaded successfully, False otherwise.
    """
    yt = YouTube(yt_url)
    yt.streams.filter(progressive=True, file_extension="mp4").order_by(
        "resolution"
    ).desc().first().download(output_path)

    return True


if __name__ == "__main__":
    download_yt_video("https://youtu.be/MLbYD_5hRXU", "videos")
