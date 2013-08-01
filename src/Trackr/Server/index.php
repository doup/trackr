<?php
$days = 0;
$minutes = 0;

foreach(glob('../../../data/20*.json') as $file) {
    $minutes += count(json_decode(file_get_contents($file), true));
    $days++;
}

echo 
    'Days: ', $days, '<br />',
    'Minutes: ', $minutes, '<br />',
    'Hours/Day: ', round(($minutes / $days) / 60, 2), '<br />',
    'Hours/Week: ', round((($minutes / $days) / 60) * 7, 2), '<br />',
'';