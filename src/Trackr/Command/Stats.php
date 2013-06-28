<?php
namespace Trackr\Command;

use Symfony\Component\Console as Console;

class Stats extends Console\Command\Command
{
    protected $thresholds;

    protected function configure()
    {
        $this
            ->setDescription('Shows daily hours statistics')
        ;
    }
  
    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {    
        $this->initThresholds($input);

        $uptime = array();
    
        foreach (glob(dirname($_SERVER['SCRIPT_FILENAME']) . '/data/*.json') as $file) {
            $date = basename($file, ".json");

            if ($date !== 'thresholds') {
                $uptime[$date] = json_decode(file_get_contents($file), true);
            }
        }
    
        // Most recent down
        ksort($uptime);
        
        // Add missing days & get MAX value
        reset($uptime);
        $first   = key($uptime);
        $daySecs = 60 * 60 * 24;
        $max     = -1;
        
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
            // Get threshold based on date
            // Gets the information from data/thresholds.json
            // Run to configure: $ tracker thresholds
            $threshold = $this->getThresholds($date);

            // Daily
            $minutes = count($ticks);
            
            if ($minutes > (60 * $threshold['lower'])) {
                $tag = ($minutes > (60 * $threshold['upper'])) ? 'toomuch' : 'soso';
            } else {
                $tag = 'info';
            }
            
            // Average
            $minsAvg = round($average[$date]);
            
            if ($minsAvg > (60 * $threshold['lower'])) {
                $tagAvg = ($minsAvg > (60 * $threshold['upper'])) ? 'toomuch' : 'soso';
            } else {
                $tagAvg = 'info';
            }

            // Print
            $row = 
                str_pad($date, 12) . 
                "<{$tag}>" . 
                    str_pad($this->formatMinutes($minutes), 9) . 
                    str_pad($this->getHoursBar($minutes, $threshold['upper']), ceil($max / 60) * 3 + 2) . 
                "</{$tag}>" .
                "<{$tagAvg}>" . 
                    str_pad($this->formatMinutes($minsAvg), 9) .
                    $this->getHoursBar($minsAvg, $threshold['upper']) .
                "</{$tagAvg}>"
            ;

            $output->writeln(str_replace('*', '<fg=cyan>|</fg=cyan>', $row));
        }

        $output->writeln('');
    }
  
    protected function formatMinutes($minutes)
    {
        $hours    = floor($minutes / 60);
        $minutes -= $hours * 60;

        return str_pad($hours, 2, " ", STR_PAD_LEFT) . "h {$minutes}m";
    }
  
    protected function getHoursBar($minutes, $upperThreshold)
    {
        $parts     = 3;
        $hours     = floor($minutes / 60);
        $minutes  -= $hours * 60;
        $fractions = floor($minutes / (60 / $parts));
        $bar       = '|' . str_repeat(str_repeat('.', $parts - 1) . '|', $hours) . str_repeat('.', $thirds);
        $position  = ceil($upperThreshold * $parts);
        $bar       = str_pad($bar, $position);

        return substr_replace($bar, '*', ceil($upperThreshold * $parts), 1);
    }

    protected function getThresholds($date)
    {
        $threshold = false;
        $date      = strtotime($date);

        foreach ($this->thresholds as $tdate => $t) {
            $tdate = strtotime($tdate);

            if ($date >= $tdate) {
                $threshold = $t;
            } else {
                break;
            }
        }

        if ($threshold === false) {
            throw new \RunTimeException('Threshold date out range, you need to set a threshold lower than: ' . date('Y-m-d', $date));
        }

        return $threshold;
    }

    protected function initThresholds(Console\Input\InputInterface $input)
    {
        $this->thresholds = array(
            '1984-12-12' => array(
                'lower' => 6,
                'upper' => 6.5,
            ),
        );

        // Load file
        $file = dirname($_SERVER['SCRIPT_FILENAME']) . '/data/thresholds.json';

        foreach (json_decode(file_get_contents($file), true) as $date => $t) {
            $this->thresholds[$date] = $t;
        }

        // Sort on date
        ksort($this->thresholds);
    }
}