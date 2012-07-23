Installation and setup
======================
This little application needs PHP to run. After downloading install vendors via Composer:
  
    $ ./composer.phar install
  
Make **trackr** executable:

    $ chmod +x trackr

Setup your crontab:

    $ crontab -e
  
Tell cron to run the tick command every minute:

    */1 * * * * /path/to/trackr tick myUser --size 1
  
Note that you must change **myUser** to your actual user (run 'whoami' if you don't know who you are...). If you prefer to track every 5 minutes use this instead:

    */5 * * * * /path/to/trackr tick myUser --size 5
    
When the system is up and running you can see some statistics with these commands:

    $ ./trackr stats
    $ ./trackr timetable