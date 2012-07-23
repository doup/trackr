<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;

class Tick extends Console\Command\Command
{
  protected function configure()
  {
    $this
      ->setDescription('Save a tick')
      ->addArgument('user', Console\Input\InputArgument::REQUIRED, 'Which user are we tracking?')
      ->addOption('size', null, Console\Input\InputOption::VALUE_REQUIRED, 'How many minutes is a tick?', 1)
    ;
  }
  
  protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
  {    
    $user = $input->getArgument('user');
    $size = +$input->getOption('size');
    $date = date('Y-m-d');
    $file = dirname($_SERVER['SCRIPT_FILENAME']) . "/data/{$date}.json";
    $tick = +date('Hi');

    // If we are in OSX and the user is not active, we just end
    if (strtoupper(PHP_OS) == 'DARWIN' && strstr(exec("stat -f '%u %Su' /dev/console"), $user) === FALSE) {
      return; 
    }

    // Init uptime var
    if (!file_exists($file)) {
      $uptime = array();
    } else {
      // Load uptime file
      $uptime = json_decode(file_get_contents($file), true); 
    }
    
    // Add entry
    if (!in_array($tick, $uptime)) {
      for ($i = 0; $i < $size; $i++) {
        $uptime[] = $tick + $i;
      }
    }
    
    // Save uptime file
    file_put_contents($file, json_encode($uptime));
  }
}