package com.Warehouse_managment.Warehouse_managment.Repository;

import com.Warehouse_managment.Warehouse_managment.Enum.StockInwardStatus;
import com.Warehouse_managment.Warehouse_managment.Model.StockInward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
public interface StockInwardRepository extends JpaRepository<StockInward, Integer>,
        JpaSpecificationExecutor<StockInward> {

    List<StockInward> findByStatus(StockInwardStatus status);

    @Query("SELECT s FROM StockInward s " +
            "WHERE (:status IS NULL OR s.status = :status) " +
            "AND (:code IS NULL OR LOWER(s.inwardCode) LIKE LOWER(CONCAT('%', :code, '%'))) " +
            "AND (:start IS NULL OR s.createdAt >= :start) " +
            "AND (:end IS NULL OR s.createdAt <= :end)")
    Page<StockInward> filter(
            @org.springframework.lang.Nullable StockInwardStatus status,
            @org.springframework.lang.Nullable String code,
            @org.springframework.lang.Nullable LocalDateTime start,
            @org.springframework.lang.Nullable LocalDateTime end,
            Pageable pageable);

    Page<StockInward> findAllByStatus(StockInwardStatus status, Pageable pageable);
}
