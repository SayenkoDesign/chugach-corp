<?php


function get_data_attributes( $data = [], $defaults = [] ) {
    
    if( empty( $data ) ) {
        return false;
    }
    
    if( empty( $defaults ) ) {
        $defaults = [
            'data-aos-once' => 'true'
        ]; 
    }
    
    $data = wp_parse_args( $data, $defaults );
    
    return _parse_data_attribute( $data ); 
}

function data_attributes( $data = [], $defaults = [] ) {
    echo get_data_attributes( $data, $defaults );
}

function aos_animations( $data = [], $defaults = [] ) {
    echo get_data_attributes( $data, $defaults );
}