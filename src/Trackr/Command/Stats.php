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
    
    krsort($uptime);
    
    // Create a new style
    $output->getFormatter()->setStyle('toomuch', new Console\Formatter\OutputFormatterStyle('red', null, array('bold', 'blink')));
    
    // Show the statistics
    $output->writeln('');
    $output->writeln('<info>STATS</info>');
    $output->writeln('');
    
    foreach ($uptime as $date => $ticks) {
      $minutes = count($ticks);
      
      $tag = $minutes > (60 * $threshold) ? 'toomuch' : 'comment';
      
      $output->writeln(str_pad($date, 12) . "<{$tag}>" . str_pad($this->formatMinutes($minutes), 9) . $this->getHoursBar($minutes) . "</{$tag}>");
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