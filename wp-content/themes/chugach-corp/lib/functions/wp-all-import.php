<?php

function post_saved($id) {
	if ( function_exists( 'relevanssi_index_doc' ) ) {
    	relevanssi_index_doc($id, true, relevanssi_get_custom_fields(), true);
	}
}
add_action('pmxi_saved_post', 'post_saved', 10, 1);


function fwp_import_posts( $import_id ) {
    if ( function_exists( 'FWP' ) ) {
        FWP()->indexer->index();
    }
}
add_action( 'pmxi_after_xml_import', 'fwp_import_posts' );

function wpae_continue_cron( $export_id, $exportObj ) {
    if ( function_exists( 'FWP' ) ) {
        FWP()->indexer->index();
    }
} 
add_action( 'pmxe_after_iteration', 'wpae_continue_cron', 10, 2 );


// [job_city({locations[1]})]

function job_city( $location ) {
	$parts = parse_location( $location );
	return $parts['city'];
}

function job_state_code( $location ) {
	$parts = parse_location( $location );
	return $parts['state_code'];
}

function job_state_name( $location ) {
	$parts = parse_location( $location );
	return $parts['state_name'];
}

function job_country( $location ) {
	$parts = parse_location( $location );
	return $parts['country'];
}

function parse_location( $location = '' ) {
	if( empty( $location ) ) {
		return [
			'city' => '',
			'state_code' => '',
			'state_name' => '',
			'country' => ''
		];
	}

	$parts = explode( ',', $location );


	$state_code = _s_get_state_code_or_name( $parts[1] );
	$state_name = _s_get_state_code_or_name( $parts[1], 'name' );
	
	return [

		'city' => $parts[0],
		'state_code' => $state_code,
		'state_name' => $state_name,
		'country' => $parts[2]
	];
}

function _s_get_state_code_or_name( $value, $type = 'code' ) {
	
	$value = trim( $value );
	
	if( empty( $value ) ) {
		return '';
	}
	
	$states = array(
		'AL'=>'Alabama',
		'AK'=>'Alaska',
		'AZ'=>'Arizona',
		'AR'=>'Arkansas',
		'CA'=>'California',
		'CO'=>'Colorado',
		'CT'=>'Connecticut',
		'DE'=>'Delaware',
		'DC'=>'District of Columbia',
		'FL'=>'Florida',
		'GA'=>'Georgia',
		'HI'=>'Hawaii',
		'ID'=>'Idaho',
		'IL'=>'Illinois',
		'IN'=>'Indiana',
		'IA'=>'Iowa',
		'KS'=>'Kansas',
		'KY'=>'Kentucky',
		'LA'=>'Louisiana',
		'ME'=>'Maine',
		'MD'=>'Maryland',
		'MA'=>'Massachusetts',
		'MI'=>'Michigan',
		'MN'=>'Minnesota',
		'MS'=>'Mississippi',
		'MO'=>'Missouri',
		'MT'=>'Montana',
		'NE'=>'Nebraska',
		'NV'=>'Nevada',
		'NH'=>'New Hampshire',
		'NJ'=>'New Jersey',
		'NM'=>'New Mexico',
		'NY'=>'New York',
		'NC'=>'North Carolina',
		'ND'=>'North Dakota',
		'OH'=>'Ohio',
		'OK'=>'Oklahoma',
		'OR'=>'Oregon',
		'PA'=>'Pennsylvania',
		'RI'=>'Rhode Island',
		'SC'=>'South Carolina',
		'SD'=>'South Dakota',
		'TN'=>'Tennessee',
		'TX'=>'Texas',
		'UT'=>'Utah',
		'VT'=>'Vermont',
		'VA'=>'Virginia',
		'WA'=>'Washington',
		'WV'=>'West Virginia',
		'WI'=>'Wisconsin',
		'WY'=>'Wyoming',
	);


	$codes = array_flip( $states );	

	if( in_array( $value, $codes ) ) {
		
		if( 'name' == $type ) {
			return $states[$value];
		} else {
			return $value;
		}
		
	} else if( in_array( $value, $states ) ) {
		if( 'code' == $type ) {
			return $codes[$value];
		} else {
			return $value;
		}
	} else {
		return $value;
	}
}

parse_location( 'Anchorage, AK, USA' );