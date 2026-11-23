<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem;
use Masbug\Flysystem\GoogleDriveAdapter;
use Google\Client as GoogleClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Storage::extend('google', function ($app, $config) {
        $client = new GoogleClient();
        $client->setClientId($config['clientId']);
        $client->setClientSecret($config['clientSecret']);
        $client->refreshToken($config['refreshToken']);

        $service = new \Google\Service\Drive($client);

        $options = [];
        if (!empty($config['folder'])) {
            $options['sharedFolderId'] = $config['folder'];
        }

        $adapter = new GoogleDriveAdapter($service, '/', $options);
        $driver = new Filesystem($adapter);

        return new FilesystemAdapter($driver, $adapter);
    });
    }
}
