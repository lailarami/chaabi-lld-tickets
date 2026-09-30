<?php
$s = 'Ticket Traité par';
if (function_exists('transliterator_transliterate')) {
    echo 'trans: ' . transliterator_transliterate('Any-Latin; Latin-ASCII', $s) . PHP_EOL;
}
if (function_exists('iconv')) {
    echo 'iconv: ' . iconv('UTF-8', 'ASCII//TRANSLIT', $s) . PHP_EOL;
}
