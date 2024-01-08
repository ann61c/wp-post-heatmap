<?php

if (!function_exists('wp_post_heatmap_get_post_data')) {
    function wp_post_heatmap_get_post_data()
    {
        $args = array('numberposts' => -1, // Fetch all posts
        );
        $posts = get_posts($args);
        $post_data = array();

        foreach ($posts as $post) {
            $date = get_the_date('Y-m-d', $post);
            $word_count = mb_strlen(strip_tags(strip_shortcodes($post->post_content)), 'UTF8');
            $title = get_the_title($post);
            $url = get_permalink($post->ID);
            $post_data[] = array('date' => $date, 'word_count' => $word_count, 'title' => $title, 'url' => $url);
        }

        return $post_data;
    }
}
if (!function_exists('wp_heatmap_shortcode')) {
    function wp_heatmap_shortcode()
    {
        // Get heatmap data
        $heatmap_data = wp_post_heatmap_get_post_data();

        // Enqueue scripts
        wp_enqueue_script('echarts-js');
        wp_enqueue_script('wp-heatmap-js', plugin_dir_url(__FILE__) . 'heatmap.js', array('jquery'), '1.0', true);

        // Localize script with data
        wp_localize_script('wp-heatmap-js', 'heatmapData', $heatmap_data);

        return '<div id="heatmap" style="max-width: 600px; height: 180px; padding: 2px; text-align: center;"></div>';
    }

    add_shortcode('heatmap', 'wp_heatmap_shortcode');
}

if (!function_exists('wp_heatmap_register_scripts')) {
    function wp_heatmap_register_scripts()
    {
        wp_register_script('echarts-js', 'https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js', array(), '5.3.0', false);
        wp_register_script('wp-heatmap-js', plugins_url('heatmap.js', __FILE__), array('jquery'), '1.0', true);
    }

    add_action('wp_enqueue_scripts', 'wp_heatmap_register_scripts');
}