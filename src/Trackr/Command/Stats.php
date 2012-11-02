<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;

class Stats extends Console\Command\Command
{
  protected function configure()
  {
    $this
      ->setDescription('Shows daily hours statistics')
      ->addOption('threshold', null, Console\Input\InputOption::VALUE_REQUIRED, 'How many hours is too much?', 5)
    ;
  }
  
  protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
  {    
    $threshold = +$input->getOption('threshold');
    $uptime    = array();
    
    foreach (glob(dirname($_SERVER['SCRIPT_FILENAME']) . '/data/*.json') as $file) {
      $date = basename($file, ".json");
      $uptime[$date] = json_decode(file_get_contents($file), true);
    }
    
    // Most recent down
    ksort($uptime);
    
    // Add missing days & get MAX value
    reset($uptime);
    $first    = key($uptime);
    $daySecs  = 60 * 60 * 24;
    $max      = -1;
    
    for ($i = strtotime($first); $i < (strtotime(date('Y-m-d')) + $daySecs); $i += $daySecs) {
      $day = date('Y-m-d', $i);
      if (!isset($uptime[$day])) {
        $uptime[$day] = array();
      }
      
      // Searching for MAX value
      if (count($uptime[$day]) > $max) {
        $max = count($uptime[$day]);
      }
    }
    
    // Sort agagin
    ksort($uptime);

    // One week Moving Average
    $average = array();

    foreach ($uptime as $day => $data) {
      $minutes = 0;
      $days    = 0;
      
      for ($i = strtotime($day) - ($daySecs * 7); $i < strtotime($day); $i += $daySecs) {
        $d = date('Y-m-d', $i);
        
        if (isset($uptime[$d])) {
          $minutes += count($uptime[$d]);
          $days++;
        }
      }
      
      $average[$day] = ($days == 0) ? 0 : $minutes / $days;
    }

    // Create a new style
    $output->getFormatter()->setStyle('soso', new Console\Formatter\OutputFormatterStyle('yellow', null, array('bold', 'blink')));
    $output->getFormatter()->setStyle('toomuch', new Console\Formatter\OutputFormatterStyle('red', null, array('bold', 'blink')));
    
    // Show the statistics
    $output->writeln('');
    $output->writeln('<info>STATS</info>');
    $output->writeln('');
    
    foreach ($uptime as $date => $ticks) {
      // Daily
      $minutes = count($ticks);
      
      if ($minutes > (60 * $threshold)) {
        $tag = ($minutes > (60 * $threshold * 1.2)) ? 'toomuch' : 'soso';
      } else {
        $tag = 'info';
      }
      
      // Average
      $minsAvg = round($average[$date]);
      
      if ($minsAvg > (60 * $threshold)) {
        $tagAvg = ($minsAvg > (60 * $threshold * 1.2)) ? 'toomuch' : 'soso';
      } else {
        $tagAvg = 'info';
      }
      
      // Print
      $output->writeln(
        str_pad($date, 12) . 
        "<{$tag}>" . 
          str_pad($this->formatMinutes($minutes), 9) . 
          str_pad($this->getHoursBar($minutes), ceil($max / 60) * 4 + 2) . 
        "</{$tag}>" .
        "<{$tagAvg}>" . 
          str_pad($this->formatMinutes($minsAvg), 9) .
          $this->getHoursBar($minsAvg) .
        "</{$tagAvg}>"
      );
    }

    $output->writeln('');
  }
  
  protected function formatMinutes($minutes)
  {
    $hours    = floor($minutes / 60);
    $minutes -= $hours * 60;

    return str_pad($hours, 2, " ", STR_PAD_LEFT) . "h {$minutes}m";
  }
  
  protected function getHoursBar($minutes)
  {
    $hours    = floor($minutes / 60);
    $minutes -= $hours * 60;
    $quarters = floor($minutes / 15);
    
    return '|' . str_repeat('...|', $hours) . str_repeat('.', $quarters);
  }
}