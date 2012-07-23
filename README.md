Installation and setup
======================
This little application needs PHP to run. After downloading install vendors via Composer:
  
    $ ./composer.phar install
  
Setup your crontab:

    $ crontab -e
  
Tell cron to run the tick command every minute:

    */1 * * * * /path/to/trackr tick myUser --size 1
  
Note that you must change myUser to your actual user. If you prefer to track every 5 minutes use this instead:

    */5 * * * * /path/to/trackr tick myUser --size 5