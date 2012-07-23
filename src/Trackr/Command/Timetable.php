<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;

class Timetable extends Console\Command\Command
{
  protected function configure()
  {
    $this
      ->setDescription('Shows a table with the average hours in six hour ranges for every weekday')
    ;
  }
  
  protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
  {    
    $table = array();
    
    // Create table structure
    for ($i = 1; $i < 8; $i++) {
      $table[$i] = array('days' => 0);
      
      for ($j = 0; $j < 6; $j++) {
        $table[$i][$j] = array(
          'days'    => array(),
          'total'   => 0,
          'average' => 0,
        );
      }
    }
    
    // Load data    
    foreach (glob(dirname($_SERVER['SCRIPT_FILENAME']) . '/data/*.json') as $file) {
      $date = basename($file, ".json");
      $wday = date('N', strtotime($date));
      $data = json_decode(file_get_contents($file), true);
      
      foreach ($data as $time) {        
        $range = floor((+$time) / 400);
        $table[$wday][$range]['total']++;
        
        if (!in_array($date, $table[$wday][$range]['days'])) {
          $table[$wday][$range]['days'][] = $date;
        }
      } 
      
      $table[$wday]['days']++;
    }
    
    // Average: each cell average it's calculated (cell total)/(day count which had some minutes in the cell)
    for ($i = 1; $i < 8; $i++) {      
      for ($j = 0; $j < 6; $j++) {
        $days = count($table[$i][$j]['days']);
        
        if ($days != 0) {
          $average = $table[$i][$j]['total'] / $days;
        } else {
          $average = 0;
        }
        
        $table[$i][$j]['average'] = $average;
        $table[$i][$j]['pretty']  = ceil(($average / 240) * 55);
        $table[$i][$j]['square']  = $this->getSquare(ceil(($average / 240) * 55));
      }
    }
    
    // DRAW!
    // Create a new style
    $output->getFormatter()->setStyle('info', new Console\Formatter\OutputFormatterStyle('cyan', null, array('bold', 'blink')));
    
    $output->writeln('');
    
    // Weekdays
    $output->write(str_repeat(' ', 14));
    
    foreach (array('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') as $day) {
      $output->write(' <info>' . str_pad($day, 13, ' ', STR_PAD_BOTH) . '</info>');
    }
    
    $output->write(PHP_EOL);
    
    // First table row
    $output->writeln(str_repeat(' ', 14) . str_repeat('+-------------', 7) . '+');
    
    // Draw rows
    for ($i = 5; $i > -1; $i--) {
      for ($r = 0; $r < 6; $r++) {
        // First column: Hours
        if ($r == 1) {
          $hours = $this->formatTime($i * 400 + 400);
        } else if ($r == 2) {
          $hours = '  -  ';
        } else if ($r == 3) {
          $hours = $this->formatTime($i * 400);
        } else {
          $hours = '';
        }
        
        $output->write('<info>' . str_pad($hours . '  ', 14, ' ', STR_PAD_LEFT) . '</info>');
        
        for ($j = 0; $j < 7; $j++) {
          if ($r == 5) {
            $output->write('| <comment>'. str_pad($this->formatMinutes($table[$j+1][$i]['average']), 11, ' ', STR_PAD_BOTH) .'</comment> ');
          } else {
            $output->write('| '. implode('', $table[$j+1][$i]['square'][$r]) .' ');
          }
        }
        
        $output->writeln('|');
      }
      
      $output->writeln(str_repeat(' ', 14) . str_repeat('+-------------', 7) . '+');
    }
    
    // Spacer
    $output->writeln('');
  }

  protected function formatMinutes($minutes)
  {
    $minutes  = round($minutes);
    $hours    = floor($minutes / 60);
    $minutes -= $hours * 60;
     
    return str_pad($hours, 2, " ", STR_PAD_LEFT) . "h {$minutes}m";
  }
  
  protected function formatTime($time) {
    $str    = str_pad($time, 4, ' ', STR_PAD_LEFT);
    $length = strlen($str);
    $tmp1   = substr($str, 0, $length - 2);
    $tmp2   = substr($str, $length - 2, $length);
    
    $tmp1   = ($tmp1 + 0 == 0) ? ' 0' : $tmp1;
    $tmp2   = ($tmp2 + 0 == 0) ? '00' : $tmp2;
    
    return $tmp1 . ':' . $tmp2;
  }
  
  protected function getSquare($fill) {
    // 11 x 5 fill template    
    $tpl = array(
      52, 44, 34, 24, 14, 10, 23, 33, 43, 51, 55,
      45, 35, 25, 15,  6,  2,  8, 22, 32, 42, 50,
      36, 26, 16, 11,  4,  1,  5, 13, 21, 31, 41,
      46, 37, 27, 17,  9,  3,  7, 20, 30, 40, 49,
      53, 47, 38, 28, 18, 12, 19, 29, 39, 48, 54,
    );
    
    $square = array();
    
    foreach ($tpl as $n) {
      $square[] = ($fill >= $n) ? '#' : ' ';
    }
    
    return array_chunk($square, 11);
  }
}