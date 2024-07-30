<?php

namespace App\Security;

//use App\Entity\Users as AppUser;
use App\Entity\Users;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    /**
     * @param UserInterface $user
     * @return void
     * Cette méthode est appelée avant l’authentification d’un utilisateur.
     * Elle vérifie si l’utilisateur est une instance de Users.
     * Si ce n’est pas le cas, elle retourne immédiatement.
     * Ensuite, elle vérifie si le champ isVerified du user est à true. Si ce n’est pas le cas,
     * elle lance une exception CustomUserMessageAccountStatusException avec
     * un message personnalisé indiquant que le compte de l’utilisateur
     * n’est pas encore activé et fournit un lien pour recevoir un nouveau mail de validation.
     */
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof Users) {
            return;
        }

        // Vérifie si le champ isVerified est à true
        if (!$user->getIsVerified()) {
            $id = $user->getId();
            $link = "<a href=/renvoi-verification/". $id . " style='text-decoration: underline'>CE LIEN</a>";
            // Lance une exception avec un message personnalisé
            throw new CustomUserMessageAccountStatusException("Votre compte n'est pas encore activé. cliquez sur " . $link . " pour recevoir un nouveau mail de validation");
        }
    }

    /**
     * @param UserInterface $user
     * @return void
     * Cette méthode est appelée après l’authentification d’un utilisateur.
     * Si à l’avenir, on a besoin d’ajouter des vérifications supplémentaires
     * après l’authentification (ex : vérifier si le compte du user a été suspendu),
     * on peut le faire dans cette méthode.
     */
    public function checkPostAuth(UserInterface $user): void
    {
//        if (!$user instanceof Users) {
//            return;
//        }

    }
}
