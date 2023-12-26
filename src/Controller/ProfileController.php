<?php

namespace App\Controller;

use App\Entity\Users;
use App\Form\UpdateEmailType;
use App\Form\UpdatePasswordType;
use App\Repository\UsersRepository;
use App\Service\JWTService;
use App\Service\SendMailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormError;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class ProfileController extends AbstractController
{
    #[Route('/profil', name: 'app_profile')]
    public function profil(
        Request $request,
        JWTService $JWTService,
        SendMailService $sendMailService,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $userPasswordHasher
    ): Response
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_home');
        }
        $formUpdateEmail = $this->createForm(UpdateEmailType::class);
        $formUpdateEmail->handleRequest($request);

        $formUpdatePassword = $this->createForm(UpdatePasswordType::class);
        $formUpdatePassword->handleRequest($request);
        $emailInBdd = $user->getEmail();
        if ($formUpdateEmail->isSubmitted()){
            if (!$formUpdateEmail->isValid()) {
                $errors = $formUpdateEmail->getErrors(true);
                $errorMessage = $errors[0]->getMessage();
                return $this->json([
                    'isSuccessful' => false,
                    'message' => $errorMessage
                ]);
            }

            $newEmail = $formUpdateEmail->get('email')->getData();
            if($newEmail === $emailInBdd){
                $formUpdateEmail->get('email')->addError(new FormError('Votre email est identique à l\'email actuel.'));
            }else{
                $header = [
                    'typ' => 'JWT',
                    'alg' => 'HS256'
                ];
                $payload = [
                    'user_id' => $user->getId(),
                    'user_email' => $newEmail
                ];
                $token = $JWTService->generate($header, $payload, $this->getParameter('app.jwtkey'));

                $sendMailService->send(
                    'no-reply@fredericpoulain.fr',
                    $newEmail,
                    'Activation de votre nouvelle adresse email',
                    'modifyEmail',
                    compact('user', 'token')
                );

                $message = "Vos informations on été mais à jour, un mail à été envoyé pour valider le changement de votre adresse email.";

                return $this->json([
                    'isSuccessful' => true,
                    'message' => $message
                ]);
            }
        }
        if ($formUpdatePassword->isSubmitted() && $formUpdatePassword->isValid()){
            if (!$userPasswordHasher->isPasswordValid($user, $formUpdatePassword->get('oldPassword')->getData())) {
                $formUpdatePassword->get('oldPassword')->addError(new FormError('Mot de passe actuel incorrect'));

            } else {
                $user->setPassword(
                    $userPasswordHasher->hashPassword(
                        $user,
                        $formUpdatePassword->get('newPassword')->getData()
                    )
                );
                $this->addFlash('successMessageFlash', 'Mot de passe modifié avec succès');
            }

            $entityManager->persist($user); //of whatever the entity object you're using to create the form2 form
            $entityManager->flush();
        }

        return $this->render('profile/profile.html.twig', [
            'formUpdateEmail' => $formUpdateEmail->createView(),
            'formUpdatePassword' => $formUpdatePassword->createView(),
            'email' => $emailInBdd
        ]);
    }
    #[Route('/profil/supprimer-compte-envoyer-mail', name: 'app_deleteProfile_sendMail')]
    public function deleteProfileSendMail(
        JWTService $JWTService,
        SendMailService $sendMailService,
    ): RedirectResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_home');
        }
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];
        $payload = [
            'user_id' => $user->getId()
        ];
        $token = $JWTService->generate($header, $payload, $this->getParameter('app.jwtkey'));

        $sendMailService->send(
            'no-reply@fredericpoulain.fr',
            $user->getEmail(),
            'Confirmez la suppression de votre compte',
            'deleteAccount',
            compact('user', 'token')
        );
        $this->addFlash('successMessageFlash', 'Un email vous a été envoyé');
        return $this->redirectToRoute('app_profile');
    }
    #[Route('/profil/supprimer-compte-confirmation/{token}', name: 'app_deleteProfile_confirm')]
    public function deleteProfileConfirm(
        $token,
        JWTService $JWTService,
        UsersRepository $usersRepository,
        EntityManagerInterface $entityManagerInterface
    )
    {
        if ($JWTService->isValid($token) && !$JWTService->isExpired($token) && $JWTService->check($token, $this->getParameter('app.jwtkey'))){
            // On récupère le payload
            $payload = $JWTService->getPayload($token);
            // On récupère le user du token
            $user = $usersRepository->find($payload['user_id']);
            if ($user){
                $entityManagerInterface->remove($user);
                $entityManagerInterface->flush();
                $this->addFlash('successMessageFlash', 'Votre compte a été supprimé avec succès');
                return $this->redirectToRoute('app_home');
            }

        }
        // Ici un problème se pose dans le token
        $this->addFlash('errorMessageFlash', 'Le token est invalide ou a expiré');
        return $this->redirectToRoute('app_home');
    }
    #[Route('/reset-email/{token}', name: 'app_reset_email')]
    public function updateEmail(
        $token,
        JWTService $JWTService,
        UsersRepository $usersRepository,
        EntityManagerInterface $entityManagerInterface
    ): RedirectResponse
    {

        //On vérifie si le token est valide, n'a pas expiré et n'a pas été modifié
        if ($JWTService->isValid($token) && !$JWTService->isExpired($token) && $JWTService->check($token, $this->getParameter('app.jwtkey'))) {
            // On récupère le payload
            $payload = $JWTService->getPayload($token);

            // On récupère le user du token
            $user = $usersRepository->find($payload['user_id']);
            $newEmail = $payload['user_email'];

            //On vérifie que l'utilisateur existe et n'a pas encore activé son compte
            if ($user) {
                $user->setEmail($newEmail);
                $entityManagerInterface->flush();
                $this->addFlash('successMessageFlash', 'Email modifié avec succès ! Vous pouvez vous reconnecter');
                return $this->redirectToRoute('app_home');
            }
        }
        // Ici un problème se pose dans le token
        $this->addFlash('errorMessageFlash', 'Le token est invalide ou a expiré');
        return $this->redirectToRoute('app_home');
    }
    //app_reset_email
}
