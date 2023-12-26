<?php

namespace App\Controller;

use App\Entity\Users;
use App\Form\RegistrationFormType;
use App\Repository\UsersRepository;
use App\Service\JWTService;
use App\Service\SendMailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegistrationController extends AbstractController
{
    #[Route('/inscription', name: 'app_register')]
    public function register(
        Request                     $request,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface      $entityManager,
        JWTService                  $JWTService,
        SendMailService             $sendMailService

    ): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }
        $user = new Users();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if (!$form->isValid()) {
                $errors = $form->getErrors(true);
                $errorMessage = $errors[0]->getMessage();
                return $this->json([
                    'isSuccessful' => false,
                    'message' => $errorMessage
                ]);
            }
            $honeyPot = $form->get('confirmPassword')->getData();
            if(!$honeyPot){
                $user->setPassword(
                    $userPasswordHasher->hashPassword(
                        $user,
                        $form->get('plainPassword')->getData()
                    )
                );
                $user->setIsVerified(false);
                $user->setCreatedAt(new \DateTimeImmutable());
                $user->setRoles(["ROLE_USER"]);
                $entityManager->persist($user);
                $entityManager->flush();
                // On génère le JWT de l'utilisateur
                // On crée le Header
                $header = [
                    'typ' => 'JWT',
                    'alg' => 'HS256'
                ];

                // On crée le Payload
                $payload = [
                    'user_id' => $user->getId()
                ];

                // On génère le token
                $token = $JWTService->generate($header, $payload, $this->getParameter('app.jwtkey'));

                $sendMailService->send(
                    'no-reply@fredericpoulain.fr',
                    $user->getEmail(),
                    'Météo/IA : Activation de votre compte',
                    'register',
                    compact('user', 'token')
                );

                return $this->json([
                    'isSuccessful' => true,
                    'message' => "Votre inscription a été effectuée. Pour activer votre compte, merci de cliquer sur le lien envoyé à votre adresse email."
                ]);
            }

        }
        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }

    #[Route('/verification/{token}', name: 'app_verif_email')]
    public function verifyUser(
        $token,
        JWTService $JWTService,
        UsersRepository $usersRepository,
        EntityManagerInterface $entityManagerInterface): Response
    {


        //On vérifie si le token est valide, n'a pas expiré et n'a pas été modifié
        if ($JWTService->isValid($token) && !$JWTService->isExpired($token) && $JWTService->check($token, $this->getParameter('app.jwtkey'))) {
            // On récupère le payload
            $payload = $JWTService->getPayload($token);

            // On récupère le user du token
            $user = $usersRepository->find($payload['user_id']);

            //On vérifie que l'utilisateur existe et n'a pas encore activé son compte
            if ($user) {
                if (!$user->getIsVerified()){
                    $user->setIsVerified(true);
                    $entityManagerInterface->flush($user);
                    $this->addFlash('successMessageFlash', 'Merci, votre compte est désormais activé ! Connectez-vous en cliquant <a href="/connexion" style="text-decoration: underline;">ICI</a>');
                    return $this->redirectToRoute('app_home');
                }
                $this->addFlash('successMessageFlash', 'Votre compte est déjà activé !');
                return $this->redirectToRoute('app_home');
            }
        }
        // Ici un problème se pose dans le token
        $this->addFlash('errorMessageFlash', 'Le token est invalide ou a expiré');
        return $this->redirectToRoute('app_home');
    }

    #[Route('/renvoi-verification/{id}', name: 'resend_verif_email')]
    public function resendVerification(
        JWTService $JWTService,
        SendMailService $sendMailService,
        Users $user
    ): Response
    {
        $id = $user->getId();
        //$this->getUser() c'est si un user est déjà connecté
        //$users->getIsVerified() c'est vérifié le status du user depuis l'id en GET
        if ($this->getUser() || $user->getIsVerified()) {
            $this->addFlash('infoMessageFlash', 'Compte déjà activé');
            return $this->redirectToRoute('app_home');
        }

        // On génère le JWT de l'utilisateur
        // On crée le Header
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        // On crée le Payload
        $payload = [
            'user_id' => $id
        ];

        // On génère le token
        $token = $JWTService->generate($header, $payload, $this->getParameter('app.jwtkey'));

        // On envoie un mail
        $sendMailService->send(
            'no-reply@fredericpoulain.fr',
            $user->getEmail(),
            'Météo/IA : Activation de votre compte',
            'register',
            compact('user', 'token')
        );
        $this->addFlash('successMessageFlash', 'Email de vérification envoyé, pour activer votre compte, merci de cliquer sur le lien envoyé à votre adresse email.');
        return $this->redirectToRoute('app_home');
    }
}
