<?php
function _s_custom_acf_toolbars( $toolbars ) {
    /* Uncomment to view format of $toolbars */
    // echo '< pre >';
    //     print_r($toolbars);
    // echo '< /pre >';
    // die;

    /**
     * Toolbars
     * -------------------- */
    /* 'justlink' - only link (should be forced to paragraph) */
    /*  - have to be wary about pasting in formatting improperly */
    $toolbars['justlink'] = array();
    $toolbars['justlink'][1] = array(
        'link'
    );

    /* 'simpler' - simple minus font sizes */
    $toolbars['simpler'] = array();
    $toolbars['simpler'][1] = array(
        'bold',
        'italic',
        'link'
    );

    /* 'simple' - just font sizes, bold/italic & links */
    $toolbars['simple'] = array();
    $toolbars['simple'][1] = array(
        'formatselect',
        'bold',
        'italic',
        'link'
    );

    /* 'medium' - adds left/center align */
    $toolbars['medium'] = array();
    $toolbars['medium'][1] = array(
        'formatselect',
        'bold',
        'italic',
        'alignleft',
        'aligncenter',
        'link'
    );

    /* 'complex' - adds lists */
    $toolbars['complex'] = array();
    $toolbars['complex'][1] = array(
        'formatselect',
        'bold',
        'italic',
        'alignleft',
        'aligncenter',
        'bullist',
        'numlist',
        'link'
    );

    /* 'content' - lists, but no alignment */
    $toolbars['content'] = array();
    $toolbars['content'][1] = array(
        'formatselect',
        'bold',
        'italic',
        'bullist',
        // 'numlist',
        'link'
    );

    /* return $toolbars - IMPORTANT! */
    return $toolbars;
}
add_filter('acf/fields/wysiwyg/toolbars', '_s_custom_acf_toolbars'  );
