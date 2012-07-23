Installation and setup
======================
This little application needs PHP to run. After download install vendors via Composer:
  
  $ ./composer.phar install
  
Setup your crontab:

  $ crontab -e
  
Add this line:

  */1 * * * * /path/to/trackr tick myUser --size 1
  
If you prefer to track every 5 minutes use this instead:

  */5 * * * * /path/to/trackr tick myUser --size 5