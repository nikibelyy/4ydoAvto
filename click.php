<?php
$type = $_GET['type'] ?? 'unknown';
if(!in_array($type, ['call','telegram'])) exit;

$file = 'clicks.json';
$data = file_exists($file) ? json_decode(file_get_contents($file), true) : ['call'=>0,'telegram'=>0];

$data[$type]++;
file_put_contents($file, json_encode($data));
?>
