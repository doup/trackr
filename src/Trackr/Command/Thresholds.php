<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;

class Thresholds extends Console\Command\Command
{
    protected $commands;
    protected $dialog;
    protected $file;
    protected $loop;
    protected $thresholds;

    protected function configure()
    {
        $this
            ->setDescription('Configure the historical thresholds')
        ;
    }
  
    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->init();
        $this->loadThresholds();

        while ($this->loop('menu')) {
            $this->showMenu($input, $output);
        }
    }

    protected function init()
    {
        $this->commands = array('add', 'delete', 'exit');
        $this->dialog   = $this->getHelperSet()->get('dialog');
        $this->file     = dirname($_SERVER['SCRIPT_FILENAME']) . '/data/thresholds.json';
        $this->loop     = array();

        sort($this->commands);
    }

    protected function loadThresholds()
    {
        if (file_exists($this->file)) {
            $this->thresholds = json_decode(file_get_contents($this->file), true);
            ksort($this->thresholds);
        } else {
            $this->thresholds = array();
        }
    }

    protected function loop($id)
    {
        if (!isset($this->loop[$id])) {
            $this->startLoop($id);
        }
        
        return $this->loop[$id];
    }

    protected function saveThresholds()
    {
        ksort($this->thresholds);
        file_put_contents($this->file, json_encode($this->thresholds));
    }

    protected function showMenu(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $commands = $this->commands;
        $that     = $this;

        $output->writeln('');
        $output->writeln('///////////////////////////////////////////////');
        $output->writeln('');
        $output->writeln('<info>THRESHOLDS</info>');
        $output->writeln('');

        if (empty($this->thresholds)) {
            $output->writeln('<comment>(EMPTY)</comment>');
        } else {
            foreach ($this->thresholds as $date => $t) {
                $output->writeln('<comment>'. $date .'</comment> ' . $t['lower'] . ' - ' . $t['upper']);
            }
        }

        $output->writeln('');

        $command = $this->dialog->select(
            $output,
            '<info>Select a command:</info> ',
            $this->commands
        );

        switch ($this->commands[$command]) {
            case 'add':
                $output->writeln('');

                $date = $this->dialog->askAndValidate(
                    $output,
                    '<info>Enter a date (default: '. date('Y-m-d') .'):</info> ',
                    function ($date) use ($that) {
                        if (empty($date)) {
                            return date('Y-m-d');
                        }

                        if (!$that->validateDate($date)) {
                            throw new \RunTimeException('Please, enter a date in YYYY-MM-DD format');
                        }

                        return $date;
                    }
                );

                $lower = floatval($this->dialog->askAndValidate(
                    $output,
                    '<info>Lower threshold:</info> ',
                    function ($lower) {
                        if (!is_numeric($lower) || floatval($lower) < 0) {
                            throw new \RunTimeException('Please, enter float number greater than 0');
                        }

                        return $lower;
                    }
                ));

                $upper = floatval($this->dialog->askAndValidate(
                    $output,
                    '<info>Upper threshold:</info> ',
                    function ($upper) use ($lower) {
                        if (!is_numeric($upper) || floatval($upper) < 0) {
                            throw new \RunTimeException('Please, enter float number greater than 0');
                        }

                        if ($upper < $lower) {
                            throw new \RunTimeException('Upper threshold ('. $upper .') must greater than lower threshold ('. $lower .')');   
                        }

                        return $upper;
                    }
                ));

                $this->thresholds[$date] = array('lower' => $lower, 'upper' => $upper);
                $this->saveThresholds();

                break;
            case 'delete':
                $dates = array_keys($this->thresholds);
                array_unshift($dates, '<comment>CANCEL</comment>');

                $date = $this->dialog->select(
                    $output,
                    '<info>Select an entry to delete:</info> ',
                    $dates
                );

                if ($date != 0) {
                    unset($this->thresholds[$dates[$date]]);
                    $this->saveThresholds();
                }

                break;
            case 'exit':
                $this->loop['menu'] = false;
                return;
        }
    }

    protected function startLoop($id)
    {
        $this->loop[$id] = true;
    }

    protected function stopLoop($id)
    {
        $this->loop[$id] = false;
    }

    public function validateDate($date)
    {
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $parts) == true) {
            return checkdate($parts[2], $parts[3], $parts[1]);
        } else {
            return false;
        }
    }
}