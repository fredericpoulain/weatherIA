<?php

namespace App\Controller;



use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ForecastWeatherIAController extends AbstractController
{

    #[Route('/prochains-jours', name: 'app_details_forecast')]
    public function forecast(): Response
    {
        return $this->render('forecast/forecast.html.twig');
    }
}
