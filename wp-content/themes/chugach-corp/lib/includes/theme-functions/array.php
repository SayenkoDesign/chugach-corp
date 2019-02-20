<?php

if( !function_exists( 'find_next_array_value' ) ) {
		
    function find_next_array_value( $current, $array, $loop = false ) {
        $nextkey = array_search( $current, $array ) + 1;
        
        if( $current == end( $array ) ) {
            
            if( !$loop )
                return false;
            $nextkey = 0;
        }
        
        return $array[$nextkey];
    }
}

if( !function_exists( 'find_prev_array_value' ) ) {
    
    function find_prev_array_value( $current, $array, $loop = false ) {
        $nextkey = array_search( $current, $array ) - 1;
        
        if( $nextkey < 0 ) {
            
            if( !$loop )
                return false;
            
            end( $array );         
            $nextkey = key( $array );
        }
        
        return $array[$nextkey];
    }
}

function array_insert_after( array $array, $key, array $new ) {
    // Never position zero
    if( is_int( $key ) ) {
        if( ! $key ) {
           $key = 1; 
        }
        $pos = $key;
    }
    else {
        $keys = array_keys( $array );
        $index = array_search( $key, $keys );
        $pos = false === $index ? count( $array ) : $index + 1;
    }
    
    return array_merge( array_slice( $array, 0, $pos ), $new, array_slice( $array, $pos ) );
}

/**
	 * Splits an array into N number of evenly distributed partitions (useful for
	 * splitting a list into columns).
	 *
	 * The function will fill as many partitions as requested, as long as there are
	 * enough elements in the array to do so.  Any remaining unfilled partitions
	 * will be represented as empty arrays.
	 *
	 * It can be sent an array of any data types or objects.
	 *
	 * @since 1.1
	 *
	 * @param array $array Array of items to be evenly distributed into columns.
	 * @param int $number_of_columns Number of columns to split the items contained in $array into.
	 * @return array An array whose elements are sub-arrays representing columns containing the distributed items from $array.
	 */
	function c2c_array_partition( $array, $number_of_columns ) {
		$number_of_columns = (int) $number_of_columns;
		$arraylen = count( $array );
		$partlen = floor( $arraylen / $number_of_columns );
		$partrem = $arraylen % $number_of_columns;
		$partition = array();
		$mark = 0;
		for ( $px = 0; $px < $number_of_columns; $px++ ) {
			$incr = ($px < $partrem) ? $partlen + 1 : $partlen;
			$partition[$px] = array_slice( $array, $mark, $incr );
			$mark += $incr;
		}
		return $partition;
	}