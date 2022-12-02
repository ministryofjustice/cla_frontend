The nodejs application has an express server which contains two components: a socket server and admin web app.

#Socket server
## Sent by client (User browser)
### identify
This message is sent by the user as soon as they land/refresh a page.

The message will contain the following fields:
- username
- usertype: Whether the user is an operator or provider
- appVersion

### startViewingCase
This message is sent by the user as soon as they start viewing a case. It will contain the case reference number.

### stopViewingCase
This message is sent by the user when they stop viewing a case. It will contain the case reference number.

## Sent by server (broadcast to users)
### peopleViewing
Upon receiving  the `startViewingCase` message,  a `peopleViewing` message is broadcast to all users viewing the case (including the
message sender). The broadcast message is a list of usernames currently viewing the case.

## Disconnect event
When the user disconnects from the socket server the `peopleViewing` message is broadcast to all other users still viewing the case.

# Admin app
The admin app has the following paths:

## /admin/notifications
Given a message, a broadcast is sent to all connected connected users of a given type (operator or provider).

# Access
The admin web app should not be accessible to the public.

At the moment there is no authentication required to send / receive messages to the socket server.

## AWS
The EC2 instances that host the socket server have a security group that limits access to port 8005 to the IP addresses
of the cla_backend server.

## Nginx
The CHS user's browser still needs to access socket server to send and receive messages.
There is an nginx `location /socket.io ` rule to proxy all requests with a path that starts with `/socket.io` to the
nodejs socket server app.
