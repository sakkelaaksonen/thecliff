<?php
// Basic PHP test
echo "PHP is working!";
echo "<br>PHP Version: " . phpversion();
echo "<br>Session support: " . (function_exists('session_start') ? 'Yes' : 'No');
?> 