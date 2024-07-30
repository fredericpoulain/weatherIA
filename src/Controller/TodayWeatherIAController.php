<?php

namespace App\Controller;



use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TodayWeatherIAController extends AbstractController
{
    #[Route('/aujourdhui', name: 'app_details_today')]
    public function aujourdhui(): Response
    {
        return $this->render('today/today.html.twig');
    }
}
