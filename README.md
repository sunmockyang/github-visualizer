# github-visualizer
Github visualizer to show real-time pull request activity

## Notes
- An object's name will be shown in the text box whenever the camera focuses on it.
- Text will be the same colour as the object.
- keypress function is used for debug keys to test interface

## GVClient.js
Where external input will interface with the app.

### Attributes
- `imageURL` - string for the image displayed on the circle

### Interfaces
`setMainBallAttr(attr)`
- `attr` - an object with fields `name` and `colour`

`createBall(id, status, colour, size)`
- `id`     - any kind of ID you wish to track the ball by. (suggested to use an id number)
- `status` - string that represents the status of the ball. (used with id to show name)
- `colour` - string using css colour format `("#FFFFFF", "rgb(...)", "hsl(...)")`
- `size`   - number of pixels the radius will be (suggested between 20 and 40 for physics not recommended to resize after creation

`mergeBall(id)`
- `id` - whatever you used for the createBall function

`setBallAttributes(id, attr)`
- `id`   - same as above
- `attr` - an object with same attribute names/values as the args for createBall

`createBoid(id, colour)`
- `id`     - the id of the ball the boid should follow
- `colour` - string using css colour format `("#FFFFFF", "rgb(...)", "hsl(...)")`
- `name`   - string of whatever you'd like it to be

### Expanding functionality
- `PullRequestNameFunction` - function that will be used by the ball to format the text. In the setup function, it is set to override the name
- `CommentNameFunction`		- Same as above but for boids.
