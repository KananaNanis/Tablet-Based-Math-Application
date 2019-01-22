<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
<meta name="viewport" content="initial-scale=1,user-scalable=no,minimum-scale=1,maximum-scale=1,width=device-width,height=device-height">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name = "format-detection" content = "telephone=no">
    <meta name="theme-color" content="#000000">
    <link rel="manifest" href="manifest.json">
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" href="app.css">
    <title>React App</title>
  </head>
  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
<?php
echo "<script>var hostname = '" . gethostname() . "';
var user_id = '" . $_SERVER['REMOTE_USER'] . "';</script>\n";
?>
</html>
