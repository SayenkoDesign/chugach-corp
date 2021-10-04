<?php

if ( ! defined( 'ULTIPRO_DIR' ) ) {
	define( 'ULTIPRO_DIR', trailingslashit( ABSPATH ) . 'ultipro' );
}

if ( ! defined( 'ULTIPRO_URI' ) ) {
	define( 'ULTIPRO_URI', trailingslashit( site_url() ) . 'ultipro' );
}

/**
 * Delete older files
 *
 * $dir String whhere the files are
 * $max_age Int in seconds
 * return String[] the list of deleted files
 */

/* function delete_older_than($dir, $max_age)
{
    $list = array();

    $limit = time() - $max_age;

    $dir = realpath($dir);

    if (!is_dir($dir)) {
        return;
    }

    $dh = opendir($dir);
    if ($dh === false) {
        return;
    }

    while (($file = readdir($dh)) !== false) {
        $file = $dir . '/' . $file;
        if (!is_file($file)) {
            continue;
        }

		var_dump( $file );

        if (filemtime($file) < $limit) {
            $list[] = $file;
            unlink($file);
        }

    }
    closedir($dh);
    return $list;

} */

function delete_older_than($dir, $max_age)
{
    $list = array();

    $limit = time() - $max_age;

    $files = glob( $dir . '/*xml' );

	foreach($files as $file){ // iterate files
		if(is_file($file) && filemtime($file) < $limit ) {
			$list[] = $file;
		  	unlink($file); // delete file
		}
	  }
	
	return $list;

}




// $files = array_diff(scandir($dir), array('.', '..'));

// print_r( $files );

// Delete backups older than 7 days
delete_older_than( ULTIPRO_DIR, 3600 * 24 * 5);


function _s_get_ultipro_file() {
	$files = scandir( ULTIPRO_DIR, SCANDIR_SORT_DESCENDING);
	return trailingslashit( ULTIPRO_DIR ) . $files[0];
}


function _s_get_ultipro_url() {
	$files = scandir( ULTIPRO_DIR, SCANDIR_SORT_DESCENDING);
	return trailingslashit( ULTIPRO_URI ) . $files[0];
}



if (isset($_GET['ultipro'])) {

	echo file_get_contents( _s_get_ultipro_file() );
    exit;
}