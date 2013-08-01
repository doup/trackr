<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;
use Symfony\Component\Process\Process as Process;

class Server extends Console\Command\Command
{
  protected function configure()
  {
    $this
      ->setDescription('Start server to view the stats')
    ;
  }
  
  protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
  {
    $server = new Process('php -S localhost:8000 -t src/Trackr/Server/');
    $open   = new Process('open http://localhost:8000');

    $server->start();
    $open->start();

    while ($server->isRunning()) {
        // waiting for process to finish
    }
  }
}
