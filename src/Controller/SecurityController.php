<?php

namespace App\Controller;

use App\Form\ResetPassRequestType;
use App\Form\ResetPassType;
use App\Repository\UsersRepository;
use App\Service\JWTService;
use App\Service\SendMailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    #[Route(path: '/connexion', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
         if ($this->getUser()) {
             return $this->redirectToRoute('app_home');
         }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', ['last_username' => $lastUsername, 'error' => $error]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
    #[Route(path: '/oubli-pass', name: 'app_forgotPass')]
    public function forgotPassword(
        Request $request,
        TokenGeneratorInterface $tokenGeneratorInterface,
        EntityManagerInterface $entityManagerInterface,
        JWTService $jwt,
        SendMailService $sendMailService,
        UsersRepository $usersRepository
    ): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }
        //!pour afficher le formulaire crée depuis le maker, il faut que le controller l'appel !
        //* la méthode createForm() vient de abstractController
        $form = $this->createForm(ResetPassRequestType::class);

        //!pour récupérer le $_POST lors de la soumission. heandleRequest nous dis "traite le formulaire"
        // en récupérant la requete via $requeste. Mais pour ça il faut l'injection de dépendance "Request $request";
        //si pas de données post, cette ligne ne fait rien du tout
        $form->handleRequest($request);

//        //! On vérifie bien si le formulaire est "soumis" et s'il est valide pour entrer dans le if et traiter les données
        if ($form->isSubmitted() && $form->isValid()) {
            //on va chercher le user par son email. Il faut donc le repository ! et encore grace à l'injection de dépendance
            // Avant on récupère le mail du formulaire :
            $emailForm = $form->get('email')->getData();
            // et on fait appel au model pour trouver le mail et donc savoir si ce mail existe !
            $user = $usersRepository->findOneByEmail($emailForm); //$user est aussi une instance de Users (getter/setter)

            //on vérifie ici l'existence du user grâce à l'email reçu en POST
            if ($user) {
                /**
                 * IMPORTANT :
                 * Je pourrais utiliser le TokenGeneratorInterface de Symfony qui génère un token unique à chaque fois qu’il est appelé.
                 * Et aussi le generateUrl pour envoyer l'url au mail. Mais je décide de garder la même logique :
                 * Token JWT et template email.
                 */
                $id = $user->getId();
                // On génère le JWT de l'utilisateur
                //Header
                $header = [
                    'typ' => 'JWT',
                    'alg' => 'HS256'
                ];

                //Payload
                $payload = [
                    'user_id' => $id
                ];
                // On génère le token
                $token = $jwt->generate($header, $payload, $this->getParameter('app.jwtkey'));

                // On envoie un mail
                $sendMailService->send(
                    'no-reply@fredericpoulain.fr',
                    $user->getEmail(),
                    'Météo/IA : Réinitialisation de votre mot de passe',
                    'forgotPassword',
                    compact('user', 'token')
                );
                $this->addFlash('successMessageFlash', 'Un email a été envoyé sur votre boîte mail, il contient un lien de réinitialisation de mot de passe.');
                return $this->redirectToRoute('app_home');
            }

            //user est null
            $this->addFlash('errorMessageFlash', 'Email inconnue');
            return $this->redirectToRoute('app_forgotPass');
        }
        return $this->render('security/resetPassRequest.html.twig', [
            'form' => $form->createView()
        ]);
    }


    #[Route(path: '/reinitialisation-pass/{token}', name: 'app_resetPass')]
    public function resetPass(
        Request $request,
        $token,
        JWTService $JWTService,
        UsersRepository $usersRepository,
        UserPasswordHasherInterface $userPasswordHasher,
        EntityManagerInterface $entityManager
    ): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        $form = $this->createForm(ResetPassType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()){
            if ($JWTService->isValid($token) && !$JWTService->isExpired($token) && $JWTService->check($token, $this->getParameter('app.jwtkey'))){
                // On récupère le payload
                $payload = $JWTService->getPayload($token);
                // On récupère le user du token
                $user = $usersRepository->find($payload['user_id']);
                if ($user){
                    $user->setPassword(
                        $userPasswordHasher->hashPassword(
                            $user,
                            $form->get('password')->getData()
                        )
                    );
                    $entityManager->persist($user);
                    $entityManager->flush();
                    $this->addFlash('successMessageFlash', 'Mot de passe réinitialisé avec succès ! Connectez-vous en cliquant <a href="/connexion" style="text-decoration: underline;">ICI</a>');
                    return $this->redirectToRoute('app_home');
                }
            }
            $this->addFlash('errorMessageFlash', 'Le token est invalide ou a expiré');

        }

        return $this->render('security/resetPass.html.twig', [
            'form' => $form->createView()
        ]);
    }

}
