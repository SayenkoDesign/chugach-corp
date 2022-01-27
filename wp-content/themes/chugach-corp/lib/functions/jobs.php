<?php
// Jobs
if ( ! defined( 'ULTIPRO_DIR' ) ) {
	define( 'ULTIPRO_DIR', trailingslashit( ABSPATH ) . 'ultipro' );
}

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

// Delete backups older than 30 days
// delete_older_than( ULTIPRO_DIR, 3600 * 24 * 30);