<?php
/**
 * Created by Team 13.
 * User: team 13
 * Date: 6/1/15
 * Time: 8:41 AM
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$lyric =  file_get_contents ( $_GET["songID"].".lrc");

if(!$lyric){
    echo "";
}else
    echo $lyric;

die();