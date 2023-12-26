<?php

namespace App\Repository;

use App\Entity\FavoriteCities;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FavoriteCities>
 *
 * @method FavoriteCities|null find($id, $lockMode = null, $lockVersion = null)
 * @method FavoriteCities|null findOneBy(array $criteria, array $orderBy = null)
 * @method FavoriteCities[]    findAll()
 * @method FavoriteCities[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FavoriteCitiesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FavoriteCities::class);
    }
    public function getCitiesBySort($user, int $sortToRemove): array
    {
        $queryBuilder = $this->createQueryBuilder('c');
        return $queryBuilder
            ->where('c.user = :user')
            ->andWhere('c.sort > :sort')
            ->setParameter('user', $user)
            ->setParameter('sort', $sortToRemove)
            ->getQuery()
            ->getResult();
    }


//    /**
//     * @return FavoriteCities[] Returns an array of FavoriteCities objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('f')
//            ->andWhere('f.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('f.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?FavoriteCities
//    {
//        return $this->createQueryBuilder('f')
//            ->andWhere('f.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
