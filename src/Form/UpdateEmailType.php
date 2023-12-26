<?php

namespace App\Form;

use App\Entity\Users;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class UpdateEmailType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
//                'mapped' => false,
                'label' => 'Nouvelle adresse email',
                'attr' => [
                    'class' => 'email'
                ],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Vous devez indiquer une adresse email.',
                    ]),
                    new Email([
                        'message' => 'L\'adresse email n\'est pas valide.',
                    ]),
                ]
            ])
        ;
    }

    //étape 1 qui permet à l'email d'être incorporé dans le formulaire
    //étape 2 dans le controller
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
//            'data_class' => Users::class
        ]);
    }
}
