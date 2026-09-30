<?php
$s = 'CLÔTURÉ';
echo 'string: ' . $s . PHP_EOL;
echo 'strlen: ' . strlen($s) . PHP_EOL;
echo 'mb_strlen: ' . mb_strlen($s, 'UTF-8') . PHP_EOL;
if (function_exists('iconv')) {
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT', $s);
    var_dump($ascii);
}
if (function_exists('transliterator_transliterate')) {
    var_dump(transliterator_transliterate('Any-Latin; Latin-ASCII', $s));
}
