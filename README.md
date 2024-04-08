# signswift

## Backend APIs

### User APIs

-   **(POST) /api/user/register** - Register a new user
-   **(POST) /api/user/login** - Login a existing user **(Provides auth token in response)**
-   **(GET) /api/user/details** - Get details of a user **(required: auth token)**

### Video APIs

-   **(GET) /api/videos** - Get all videos of a user **(required: auth token)**
-   **(POST) /api/videos** - Add new video for a user **(required: auth token)**
-   **(DELETE) /api/videos** - Delete all videos of a user **(required: auth token)**
-   **(PUT) /api/vides** - Update video with inference **(required: auth token, videoId)**
