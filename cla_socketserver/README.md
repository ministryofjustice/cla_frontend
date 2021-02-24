#Socket messages
## Sent by user on the CHS frontend app
### identify
This message is sent by the user as soon as they land/refresh a page.

The message will contain the following fields:
- username
- usertype: Whether the user is an operator or provider
- appVersion

### startViewingCase
This message is sent by the user as soon as a they starts viewing a case. It will contain the case reference number.

### stopViewingCase
This message is sent by the user when they stop viewing a case. It will contain the case reference number.

## Broadcast to users
### peopleViewing
Upon receiving  the `startViewingCase` message,  a `peopleViewing` message is broadcast to all users viewing the case (including the
message sender). The broadcast message is a list of usernames currently viewing the case.

## Disconnect event
When the user disconnects from the socket server the `peopleViewing` message is broadcast to all other users still viewing the case.

# Statsd
When any of of the above messages are received by the socket server, the number of users connected to the socket server as well as 
the versions of the app that they are using is sent to a statsd server defined in the ` process.env.STATSD_HOST` environment variable.

# Admin app
The admin app has the following paths:

## /admin
Redirects to `/admin/broadcast/`, see below.

##/admin/broadcast
On a `GET` it presents a form with all the users connected and the opportunity to send a message to a specific user or
all the connected users.
  

## /admin/peopleMap
Returns a JSON of all the connected users.

## /admin/notifications
Given a message, a broadcast is sent to all connected connected users of a given type(operator or provider).

# Access
The nodejs socket server app contains both socket server and also an admin web app.

The admin web app should not be accessible to the public.

At the moment there is no authentication required to send / receive messages to the socket server. 

## AWS
The EC2 instances that host the nodejs socket server have a security group that limits access to port 8005 to the IP addresses
of the cla_backend server IP addresses

## Nginx
The CHS users browser still needs to access socket server to send and receive messages.
There is an nginx `location /socket.io ` rule to proxy all requests with a path that starts with `/socket.io` to the
nodejs socket server app.
