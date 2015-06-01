<?php
/**
 * Created by Team 13.
 * User: team 13
 * Date: 6/1/15
 * Time: 7:42 AM
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$error = file_put_contents ( $_POST["songID"].".lrc" , $_POST["lyric"]);
echo $error;
die();