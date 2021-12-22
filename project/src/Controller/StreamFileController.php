<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Annotation\Route;

class StreamFileController extends AbstractController
{
    #[Route(path: '/stream-file/{seconds}', requirements: ['seconds' => '\d+'])]
    public function __invoke(int $seconds): Response
    {
        $response = new StreamedResponse();
        $response->setCallback(
            static function () use ($seconds) {
                $handle = fopen('php://output', 'w+');

                sleep($seconds);
                fwrite($handle, "tada! slept for $seconds seconds");

                fclose($handle);
            }
        );
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set(
            'Content-Disposition',
            'attachment; filename="'.(new \DateTime())->format('Ymd_His').'.txt"'
        );

        return $response;
    }
}
