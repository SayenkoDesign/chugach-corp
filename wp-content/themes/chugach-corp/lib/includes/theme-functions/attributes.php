<?php

function _parse_data_attribute( $data, $combine = '=', $sep = ' ' ) {
	if( is_array( $data ) ) {
		$t = array();
		foreach( $data as $k => $v ) {
			if( !empty( $v ) ) {
                if( is_numeric( $v ) ) {
                    $v = '"' . $v . '"';
                }
				$t[] = sprintf('%s%s%s', $k, $combine, $v);
			}
		}
		
		return implode( $sep, $t );
	}
	else {
		return $data;	
	}
}